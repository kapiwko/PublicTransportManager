<?php

namespace App\Query;

use App\Entity\BusStopGroup;
use App\ViewData\BusStopGroupData;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;

class GetAllBusStopGroupsQuery implements QueryInterface
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * @return array|BusStopGroupData[]
     */
    public function __invoke(): array
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->from(BusStopGroup::class, 'busStopGroup');
        $queryBuilder->select(
            'busStopGroup.id',
            'busStopGroup.name'
        );
        $queryBuilder->groupBy('busStopGroup.id');
        $query = $queryBuilder->getQuery();

        return array_map(function (array $data): BusStopGroupData {
            return new BusStopGroupData($data['id'], $data['name']);
        }, $query->getResult(AbstractQuery::HYDRATE_ARRAY));
    }
}
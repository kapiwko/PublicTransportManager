<?php

namespace App\Query;

use App\Entity\BusStopGroup;
use App\ViewData\BusStopGroupData;
use App\ViewData\BusStopGroupDataCollection;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;

class GetAllBusStopGroupsQuery implements QueryInterface
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(): BusStopGroupDataCollection
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->from(BusStopGroup::class, 'busStopGroup');
        $queryBuilder->select(
            'busStopGroup.id',
            'busStopGroup.name'
        );
        $queryBuilder->groupBy('busStopGroup.id');
        $query = $queryBuilder->getQuery();

        $collection = new BusStopGroupDataCollection();
        foreach ($query->getResult(AbstractQuery::HYDRATE_ARRAY) as $data) {
            $collection->add(new BusStopGroupData($data['id'], $data['name']));
        }
        return $collection;
    }
}
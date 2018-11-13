<?php

namespace App\Repository\BusStopGroup;

use App\Entity\BusStopGroup;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\UuidInterface;

class GetBusStopGroupById
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(UuidInterface $id): ?BusStopGroup
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->select('busStopGroup');
        $queryBuilder->from(BusStopGroup::class,'busStopGroup');
        $queryBuilder->where('busStopGroup.id = :id');
        $queryBuilder->setParameter('id', $id);
        $queryBuilder->groupBy('busStopGroup.id');
        $query = $queryBuilder->getQuery();
        return $query->getOneOrNullResult();
    }
}
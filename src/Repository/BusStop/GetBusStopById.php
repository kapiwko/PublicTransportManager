<?php

namespace App\Repository\BusStop;

use App\Entity\BusStop;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\UuidInterface;

class GetBusStopById
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(UuidInterface $id): ?BusStop
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->select('busStop');
        $queryBuilder->from(BusStop::class,'busStop');
        $queryBuilder->where('busStop.id = :id');
        $queryBuilder->setParameter('id', $id);
        $queryBuilder->groupBy('busStop.id');
        $query = $queryBuilder->getQuery();
        return $query->getOneOrNullResult();
    }
}